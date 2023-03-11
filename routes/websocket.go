package routes

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"os/exec"
	"strconv"
	"time"

	"github.com/gorilla/websocket"
	"github.com/help-14/mountain/utils"
)

// Client management
type ClientManager struct {
	//The client map stores and manages all long connection clients, online is TRUE, and those who are not there are FALSE
	clients map[*Client]bool
	//Web side MESSAGE we use Broadcast to receive, and finally distribute it to all clients
	broadcast chan []byte
	//Newly created long connection client
	register chan *Client
	//Newly canceled long connection client
	unregister chan *Client
}

// Client
type Client struct {
	//User ID
	id string
	//Connected socket
	socket *websocket.Conn
	//Message
	send chan []byte
}

// Will formatting Message into JSON
type Message struct {
	//Message Struct
	Sender    string `json:"sender,omitempty"`
	Recipient string `json:"recipient,omitempty"`
	Content   string `json:"content,omitempty"`
	ServerIP  string `json:"serverIp,omitempty"`
	SenderIP  string `json:"senderIp,omitempty"`
}

// Create a client manager
var manager = ClientManager{
	broadcast:  make(chan []byte),
	register:   make(chan *Client),
	unregister: make(chan *Client),
	clients:    make(map[*Client]bool),
}

func NewUuid() string {
	newUUID, err := exec.Command("uuidgen").Output()
	if err != nil {
		utils.LogError(err)
		return strconv.FormatInt(time.Now().Unix(), 10)
	}
	return string(newUUID)
}

func (manager *ClientManager) start() {
	for {
		select {
		//If there is a new connection access, pass the connection to conn through the channel
		case conn := <-manager.register:
			//Set the client connection to true
			manager.clients[conn] = true
			//Format the message of returning to the successful connection JSON
			jsonMessage, _ := json.Marshal(&Message{Content: "/A new socket has connected. ", ServerIP: LocalIp(), SenderIP: conn.socket.RemoteAddr().String()})
			//Call the client's send method and send messages
			manager.send(jsonMessage, conn)
			//If the connection is disconnected
		case conn := <-manager.unregister:
			//Determine the state of the connection, if it is true, turn off Send and delete the value of connecting client
			if _, ok := manager.clients[conn]; ok {
				close(conn.send)
				delete(manager.clients, conn)
				jsonMessage, _ := json.Marshal(&Message{Content: "/A socket has disconnected. ", ServerIP: LocalIp(), SenderIP: conn.socket.RemoteAddr().String()})
				manager.send(jsonMessage, conn)
			}
			//broadcast
		case message := <-manager.broadcast:
			//Traversing the client that has been connected, send the message to them
			for conn := range manager.clients {
				select {
				case conn.send <- message:
				default:
					close(conn.send)
					delete(manager.clients, conn)
				}
			}
		}
	}
}

// Define the send method of client management
func (manager *ClientManager) send(message []byte, ignore *Client) {
	for conn := range manager.clients {
		//Send messages not to the shielded connection
		if conn != ignore {
			conn.send <- message
		}
	}
}

// Define the read method of the client structure
func (c *Client) read() {
	defer func() {
		manager.unregister <- c
		_ = c.socket.Close()
	}()

	for {
		//Read message
		_, message, err := c.socket.ReadMessage()
		//If there is an error message, cancel this connection and then close it
		if err != nil {
			manager.unregister <- c
			_ = c.socket.Close()
			break
		}
		//If there is no error message, put the information in Broadcast
		jsonMessage, _ := json.Marshal(&Message{Sender: c.id, Content: string(message), ServerIP: LocalIp(), SenderIP: c.socket.RemoteAddr().String()})
		manager.broadcast <- jsonMessage
	}
}

func (c *Client) write() {
	defer func() {
		_ = c.socket.Close()
	}()

	for {
		select {
		//Read the message from send
		case message, ok := <-c.send:
			//If there is no message
			if !ok {
				_ = c.socket.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			//Write it if there is news and send it to the web side
			_ = c.socket.WriteMessage(websocket.TextMessage, message)
		}
	}
}

// func main() {
// 	fmt.Println("Starting application...")
// 	//Open a goroutine execution start program
// 	go manager.Start()
// 	//Register the default route to /ws, and use the wsHandler method
// 	http.HandleFunc("/ws", wsHandler)
// 	http.HandleFunc("/ws/health", healthHandler)
// 	//Surveying the local 8011 port
// 	fmt.Println("chat server start.....")
// 	//Note that this must be 0.0.0.0 to deploy in the server to use
// 	_ = http.ListenAndServe("0.0.0.0:8448", nil)
// }

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024 * 1024 * 1024,
	WriteBufferSize: 1024 * 1024 * 1024,
	//Solving cross-domain problems
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func wsHandler(res http.ResponseWriter, req *http.Request) {
	//Upgrade the HTTP protocol to the websocket protocol
	conn, err := upgrader.Upgrade(res, req, nil)
	if err != nil {
		http.NotFound(res, req)
		return
	}

	//Every connection will open a new client, client.id generates through UUID to ensure that each time it is different
	client := &Client{id: NewUuid(), socket: conn, send: make(chan []byte)}
	//Register a new link
	manager.register <- client

	//Start the message to collect the news from the web side
	go client.read()
	//Start the corporation to return the message to the web side
	go client.write()
}

func healthHandler(res http.ResponseWriter, _ *http.Request) {
	_, _ = res.Write([]byte("ok"))
}

func LocalIp() string {
	address, _ := net.InterfaceAddrs()
	var ip = "localhost"
	for _, address := range address {
		if ipAddress, ok := address.(*net.IPNet); ok && !ipAddress.IP.IsLoopback() {
			if ipAddress.IP.To4() != nil {
				ip = ipAddress.IP.String()
			}
		}
	}
	return ip
}

func SetupWebSocket() {
	utils.LogInfo("Setup websocket route...")
	go manager.start()
	http.HandleFunc("/ws/health", healthHandler)
	http.HandleFunc("/ws", wsHandler)

	err := http.ListenAndServe(":8081", nil)
	if err != nil {
		log.Fatal("ListenAndServe :8081", err)
	}
}
