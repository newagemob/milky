import { NextResponse } from "next/server"
import { getComponentById } from "@/lib/components-data"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const component = getComponentById(id)

  if (!component) {
    return new NextResponse("Component not found", { status: 404 })
  }

  const fileContent = component.code
  const fileName = `${id}.tsx`

  // Set headers for file download
  const headers = new Headers()
  headers.set("Content-Disposition", `attachment; filename=${fileName}`)
  headers.set("Content-Type", "text/plain")

  return new NextResponse(fileContent, {
    status: 200,
    headers,
  })
}
