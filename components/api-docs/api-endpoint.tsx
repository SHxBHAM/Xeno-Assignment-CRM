import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type ApiEndpointProps = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  endpoint: string
  description: string
  pathParams?: Record<string, string>
  queryParams?: Record<string, string>
  requestBody?: Record<string, string>
  responses: Record<string, string>
}

export function ApiEndpoint({
  method,
  endpoint,
  description,
  pathParams,
  queryParams,
  requestBody,
  responses,
}: ApiEndpointProps) {
  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-500 text-white"
      case "POST":
        return "bg-blue-500 text-white"
      case "PUT":
        return "bg-yellow-500 text-white"
      case "DELETE":
        return "bg-red-500 text-white"
      case "PATCH":
        return "bg-purple-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <Card className="mb-4 border-zinc-800">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Badge className={`${getMethodColor(method)} font-mono`}>{method}</Badge>
          <div>
            <h3 className="text-lg font-mono">{endpoint}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>

        {pathParams && Object.keys(pathParams).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Path Parameters</h4>
            <div className="bg-zinc-900 p-3 rounded-md">
              <pre className="text-xs">{JSON.stringify(pathParams, null, 2)}</pre>
            </div>
          </div>
        )}

        {queryParams && Object.keys(queryParams).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Query Parameters</h4>
            <div className="bg-zinc-900 p-3 rounded-md">
              <pre className="text-xs">{JSON.stringify(queryParams, null, 2)}</pre>
            </div>
          </div>
        )}

        {requestBody && Object.keys(requestBody).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Request Body</h4>
            <div className="bg-zinc-900 p-3 rounded-md">
              <pre className="text-xs">{JSON.stringify(requestBody, null, 2)}</pre>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Responses</h4>
          <div className="space-y-2">
            {Object.entries(responses).map(([code, description]) => (
              <div key={code} className="flex items-start gap-2">
                <Badge variant={code.startsWith("2") ? "default" : "destructive"} className="font-mono">
                  {code}
                </Badge>
                <span className="text-sm">{description}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
