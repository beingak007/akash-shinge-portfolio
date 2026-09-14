import type { CodeSnippet } from "../types/index.ts";

export const featuredSnippet: CodeSnippet = {
  id: "price-quote",
  filename: "PriceQuote.java",
  language: "java",
  explanation:
    "A use-case stays thin. Persistence, HTTP, and Kafka live at the edges. The method name is the business action — price the quote, then tell the system it happened.",
  lines: [
    { type: "code", text: "@Service", token: "plain" },
    { type: "code", text: "public final class PriceQuote {", token: "keyword" },
    { type: "blank", text: "" },
    { type: "code", text: "  private final QuoteCatalog catalog;", token: "type" },
    { type: "code", text: "  private final DomainEvents events;", token: "type" },
    { type: "blank", text: "" },
    { type: "code", text: "  public QuoteView handle(PriceQuoteCommand cmd) {", token: "fn" },
    { type: "code", text: "    var quote = catalog.price(", token: "plain" },
    { type: "code", text: "        cmd.instrument(), cmd.quantity());", token: "plain" },
    { type: "code", text: "    events.emit(new QuotePriced(", token: "plain" },
    { type: "code", text: "        quote.id(), quote.amount()));", token: "plain" },
    { type: "code", text: "    return QuoteView.from(quote);", token: "plain" },
    { type: "code", text: "  }", token: "plain" },
    { type: "code", text: "}", token: "plain" },
  ],
};
