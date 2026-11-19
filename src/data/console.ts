import type { HighlightLanguage } from "../utils/highlight.ts";
import { featuredSnippet } from "./code.ts";

/**
 * Files shown in the Developer Console. These are ILLUSTRATIVE snippets,
 * written for this portfolio to show how the code is structured; none of them
 * come from an employer's or client's codebase.
 */
export interface ConsoleFile {
  /** Stable id for keys and DOM ids. */
  id: string;
  filename: string;
  /** Folder shown in the explorer and breadcrumb, no trailing slash. */
  dir: string;
  language: HighlightLanguage;
  /** Shown in the status bar. */
  languageLabel: string;
  /** Heading for the note beside the editor. */
  title: string;
  /** 1–3 sentences: what the snippet demonstrates. */
  note: string;
  /** Things to notice, rendered as chips. */
  focus: readonly string[];
  code: string;
}

/** Trims the newline after the opening backtick and any trailing whitespace. */
function source(text: string): string {
  return text.replace(/^\n/, "").trimEnd();
}

const priceQuote: ConsoleFile = {
  id: "price-quote",
  filename: featuredSnippet.filename,
  dir: "backend/pricing",
  language: "java",
  languageLabel: "Java 21",
  title: "Keep the use-case thin.",
  note: featuredSnippet.explanation,
  focus: ["@Service", "Domain events", "I/O at the edges"],
  code: featuredSnippet.lines.map((line) => line.text).join("\n"),
};

const orderController: ConsoleFile = {
  id: "order-controller",
  filename: "OrderController.java",
  dir: "backend/orders",
  language: "java",
  languageLabel: "Java 21 · Spring Boot",
  title: "A layered Spring Boot slice.",
  note:
    "Each layer has one job: the controller validates and maps, the service owns the transaction, the repository persists. The outbox row commits in the same transaction as the order, so an event is never published for an order that rolled back, or lost for one that didn't.",
  focus: ["Bean Validation", "@Transactional", "Transactional outbox"],
  code: source(`
@RestController
@RequiredArgsConstructor
class OrderController {
  private final OrderService service;

  @PostMapping("/api/orders")
  @ResponseStatus(HttpStatus.CREATED)
  OrderView place(@Valid @RequestBody PlaceOrder req) {
    return OrderView.from(service.place(req));
  }
}

record PlaceOrder(@NotNull UUID customerId,
                  @NotEmpty List<@Valid OrderLine> lines) {}

@Service
@RequiredArgsConstructor
class OrderService {
  private final OrderRepository orders;
  private final OutboxRepository outbox;

  @Transactional // the order and its event commit together, or not at all
  Order place(PlaceOrder req) {
    Order order = orders.save(Order.open(req.customerId(), req.lines()));
    outbox.save(OutboxEvent.of("order.placed", order.id(), order));
    return order;
  }
}

interface OrderRepository extends JpaRepository<Order, UUID> {}
`),
};

const orderTimeline: ConsoleFile = {
  id: "order-timeline",
  filename: "OrderTimeline.tsx",
  dir: "web/orders",
  language: "tsx",
  languageLabel: "TypeScript · React",
  title: "UI that tells the truth.",
  note:
    "Loading, empty, error and data are separate states in one discriminated union, so the screen can't show a blank list while a request is still in flight or has quietly failed. The request is aborted when the order changes or the view unmounts.",
  focus: ["Discriminated union", "AbortController", "Empty is not error"],
  code: source(`
type Load<T> =
  | { status: "loading" }
  | { status: "error"; reason: string }
  | { status: "ready"; data: T };

// Rendered with key={orderId}, so every order starts at "loading".
export function OrderTimeline({ orderId }: { orderId: string }) {
  const [state, setState] = useState<Load<OrderEvent[]>>({ status: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    getJson<OrderEvent[]>(\`/api/orders/\${orderId}/events\`, ctrl.signal)
      .then((data) => setState({ status: "ready", data }))
      .catch((err: Error) => {
        if (ctrl.signal.aborted) return;
        setState({ status: "error", reason: err.message });
      });
    return () => ctrl.abort();
  }, [orderId]);

  if (state.status === "loading") return <Skeleton label="Loading activity" />;
  if (state.status === "error") return <ErrorNote detail={state.reason} />;
  if (state.data.length === 0) return <EmptyState title="No activity yet" />;

  return (
    <ol className="timeline" aria-label="Order activity">
      {state.data.map((event) => <TimelineItem key={event.id} event={event} />)}
    </ol>
  );
}
`),
};

const orderEvents: ConsoleFile = {
  id: "order-events",
  filename: "OrderEventsConsumer.java",
  dir: "backend/orders",
  language: "java",
  languageLabel: "Java 21 · Spring Kafka",
  title: "Keyed producer, idempotent consumer.",
  note:
    "The order id is the message key, so one order's events share a partition and arrive in order. Delivery is at-least-once, so each event id is recorded in the same transaction as its effect and a redelivery is a no-op; a message that keeps failing is retried, then parked on a dead-letter topic.",
  focus: ["Partition key", "Idempotency", "Dead-letter topic"],
  code: source(`
@Component
@RequiredArgsConstructor
class OrderEventsPublisher {
  private final KafkaTemplate<String, OrderEvent> kafka;

  // Key = orderId: one order's events share a partition and stay in order.
  void publish(OrderEvent event) {
    kafka.send("orders.events", event.orderId().toString(), event);
  }
}

@Component
@RequiredArgsConstructor
class OrderEventsConsumer {
  private final ProcessedEvents processed;
  private final Fulfilment fulfilment;

  @RetryableTopic(attempts = "4", backoff = @Backoff(delay = 500, multiplier = 2))
  @KafkaListener(topics = "orders.events", groupId = "fulfilment")
  @Transactional
  void on(OrderEvent event) {
    if (!processed.markIfNew(event.eventId())) return; // duplicate delivery
    fulfilment.apply(event);
  }

  @DltHandler // retries exhausted or unreadable: parked on orders.events-dlt
  void parked(OrderEvent event) {
    fulfilment.flagForReview(event.orderId());
  }
}
`),
};

const schema: ConsoleFile = {
  id: "schema",
  filename: "schema.sql",
  dir: "db",
  language: "sql",
  languageLabel: "MySQL 8 · Cassandra CQL",
  title: "Relational truth, query-first reads.",
  note:
    "MySQL is the system of record: constraints, a unique idempotency key and an index shaped like the hot query guard what the code already checks. The Cassandra table starts from the question it answers (one customer's activity for a day, newest first), so every read hits a single bounded partition.",
  focus: ["Constraints", "Composite index", "Partition key"],
  code: source(`
-- MySQL: the system of record. Constraints back up what the code checks.
CREATE TABLE orders (
  id               BINARY(16)      NOT NULL,
  customer_id      BINARY(16)      NOT NULL,
  idempotency_key  VARCHAR(64)     NOT NULL,
  status           ENUM('PLACED', 'PAID', 'SHIPPED', 'CANCELLED') NOT NULL,
  total_minor      BIGINT UNSIGNED NOT NULL CHECK (total_minor > 0),
  currency         CHAR(3)         NOT NULL,
  version          INT             NOT NULL DEFAULT 0,
  created_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_idempotency (idempotency_key),
  KEY ix_orders_customer_recent (customer_id, created_at DESC)
) ENGINE = InnoDB;

-- Cassandra (CQL): one table per query, partitioned by what the query asks.
-- SELECT * FROM order_activity_by_customer WHERE customer_id = ? AND day = ?;
CREATE TABLE order_activity_by_customer (
  customer_id  uuid,
  day          date,      -- bucket: keeps every partition bounded
  occurred_at  timeuuid,
  order_id     uuid,
  event_type   text,
  PRIMARY KEY ((customer_id, day), occurred_at)
) WITH CLUSTERING ORDER BY (occurred_at DESC)
  AND default_time_to_live = 7776000; -- 90 days
`),
};

const architecture: ConsoleFile = {
  id: "architecture",
  filename: "architecture.md",
  dir: "docs",
  language: "text",
  languageLabel: "Markdown",
  title: "Events between services.",
  note:
    "Requests stay synchronous only as far as the service that owns the data. From there, change fans out as events on Kafka, and each consumer keeps the store shaped for its own reads: MySQL for records, Redis for hot lookups, Cassandra for timelines.",
  focus: ["API gateway", "Kafka topics", "Polyglot persistence"],
  code: source(`
# Order platform: event flow

                      ┌───────────────┐
                      │     client    │  web · mobile
                      └───────┬───────┘
                              │ HTTPS
                      ┌───────┴───────┐
                      │  API gateway  │  auth · rate limits · routing
                      └───────┬───────┘
          ┌───────────────────┼───────────────────┐
          ↓                   ↓                   ↓
  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
  │   order-svc   │   │  product-svc  │   │ inventory-svc │
  └───────┬───────┘   └───────┬───────┘   └───────┬───────┘
          │ outbox            │                   │
  ╔═══════╧═══════════════════╧═══════════════════╧═══════╗
  ║ Kafka · orders.events · catalog.events · stock.events ║
  ║ keyed by entity id · at-least-once · retry, then DLT  ║
  ╚═══════╤═══════════════════╤═══════════════════╤═══════╝
          ↓                   ↓                   ↓
  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
  │   fulfilment  │   │ catalog-cache │   │ activity-feed │
  └───────┬───────┘   └───────┬───────┘   └───────┬───────┘
          ↓                   ↓                   ↓
        MySQL               Redis             Cassandra
  system of record     hot reads, TTL     query-first feed
`),
};

/** Tab order. Typed non-empty so the first file is always defined. */
export const consoleFiles: readonly [ConsoleFile, ...ConsoleFile[]] = [
  priceQuote,
  orderController,
  orderTimeline,
  orderEvents,
  schema,
  architecture,
];
