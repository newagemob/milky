import ComponentList from "@/components/ComponentList"

export default function ComponentsPage() {
  return (
    <main className="pt-20 pb-16 px-4 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4 amber-text terminal-font">All Components</h1>
        <p className="text-xl text-amber-300">Browse and download all available WebGL components</p>
      </div>

      <ComponentList />
    </main>
  )
}
