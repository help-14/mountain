import SplitPanel from "~/components/SplitPanel";
import Nav from "~/components/Nav";
import ListingPanel from "~/components/ListingPanel";

export default function Home() {
  return (
    <main class="flex flex-col h-screen overflow-hidden">
      <div class="w-full">
        <Nav />
      </div>
      <div class="flex-1 overflow-hidden pt-12">
        <SplitPanel createNew={() => <ListingPanel />} />
      </div>
    </main>
  );
}
