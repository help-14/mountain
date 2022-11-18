# Contributing

## Project Structure

The project is mainly composed by one repository, hosted on GitHub. The backend side of the application is written in Go, while the frontend is purely HTML, CSS and Javascript.

```
  assets            // Frontend assets will be serve as static files
    | css
    | img
    | js
    | webfonts
  response          // Data response type for backend
  routes            // Backend api routing
  templates         // Frontend template using go template
    | modals        // Modal part
    | pages         // Frontend page like index.html
    | parts         // Part of the page that can be reuseable
  utils             // Some utility code for backend
    
```

## Technology

Technology used by the backend:
- Golang: primary programing language
- Gin: golang web framework

Technology used by the frontend:
- Go template: Template framework
- Bootstrap: UI framework
- AlpineJS: data -> template framework
- Dragselect: drag library

## Build

Every push to `main` branch will trigger Github action to build Docker `dev` image.

Create a release will create `latest` image.