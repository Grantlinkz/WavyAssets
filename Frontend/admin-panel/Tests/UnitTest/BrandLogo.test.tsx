// Vitest globals enabled
import { renderToString } from "react-dom/server"
import { BrandLogo } from "../../src/components/common/BrandLogo"

describe("BrandLogo", () => {
  it("renders with default styling and institutional branding elements", () => {
    const html = renderToString(<BrandLogo />)
    expect(html).toContain('data-testid="brand-logo"')
    expect(html).toContain("WAVY")
    expect(html).toContain("ASSETS")
    expect(html).toContain("SECURED")
  })

  it("can hide the secured badge when requested", () => {
    const html = renderToString(<BrandLogo showSecuredBadge={false} />)
    expect(html).toContain('data-testid="brand-logo"')
    expect(html).toContain("WAVY")
    expect(html).toContain("ASSETS")
    expect(html).not.toContain("SECURED")
  })

  it("applies custom className", () => {
    const html = renderToString(<BrandLogo className="h-10 custom-class" />)
    expect(html).toContain("custom-class")
  })
})