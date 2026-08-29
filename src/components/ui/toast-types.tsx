"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

export function ToastTypes() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => toast.add({ description: "Event has been created." })}
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
            type: "success",
            description: "Successfully logged in!",
          })
        }
      >
        Login
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
            type: "info",
            description: "You have been logged out.",
          })
        }
      >
        Logout
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
            type: "error",
            description: "An error occurred during authentication.",
            priority: "high",
          })
        }
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.add({
            type: "success",
            description: "Checkout complete! Order #1 is confirmed.",
          })
        }
      >
        Checkout Done
      </Button>
    </div>
  )
}
