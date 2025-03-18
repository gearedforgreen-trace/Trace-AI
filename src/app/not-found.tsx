import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { HomeIcon } from "lucide-react"
import SiteBrandCentered from "@/components/site-brand-centerd"
export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center space-y-6 bg-background text-foreground">
      <SiteBrandCentered />
      <div className="space-y-4 text-center">
        <h1 className="text-8xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      
      <Button asChild variant="default" color="gradiant" size="lg" className="gap-2">
        <Link href="/">
          <HomeIcon className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  )
}