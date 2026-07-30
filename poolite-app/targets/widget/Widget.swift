import WidgetKit
import SwiftUI

// Salvadanaio home-screen widget. Reads the numbers the app writes into the
// shared App Group (see src/lib/widgetBridge.ts) — no network, no computation.

private let appGroup = "group.it.poolite.app"

struct SalvadanaioData {
    var total: Double
    var today: Double
    var days: Int
    var streak: Int

    static func load() -> SalvadanaioData {
        let defaults = UserDefaults(suiteName: appGroup)
        guard let dict = defaults?.dictionary(forKey: "salvadanaio") else {
            return SalvadanaioData(total: 0, today: 0, days: 0, streak: 0)
        }
        return SalvadanaioData(
            total: dict["total"] as? Double ?? 0,
            today: dict["today"] as? Double ?? 0,
            days: dict["days"] as? Int ?? 0,
            streak: dict["streak"] as? Int ?? 0
        )
    }
}

struct SalvadanaioEntry: TimelineEntry {
    let date: Date
    let data: SalvadanaioData
}

struct SalvadanaioProvider: TimelineProvider {
    func placeholder(in context: Context) -> SalvadanaioEntry {
        SalvadanaioEntry(date: Date(), data: SalvadanaioData(total: 47.6, today: 1.7, days: 28, streak: 12))
    }

    func getSnapshot(in context: Context, completion: @escaping (SalvadanaioEntry) -> Void) {
        completion(SalvadanaioEntry(date: Date(), data: SalvadanaioData.load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SalvadanaioEntry>) -> Void) {
        let entry = SalvadanaioEntry(date: Date(), data: SalvadanaioData.load())
        // The app pushes fresh data + reloads on open; refresh every 6h as a fallback.
        let next = Calendar.current.date(byAdding: .hour, value: 6, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

private func euro(_ value: Double) -> String {
    let formatter = NumberFormatter()
    formatter.numberStyle = .currency
    formatter.currencyCode = "EUR"
    formatter.locale = Locale(identifier: "it_IT")
    return formatter.string(from: NSNumber(value: value)) ?? "0,00 €"
}

struct SalvadanaioWidgetView: View {
    var entry: SalvadanaioEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 4) {
                Text("🐷")
                Text("SALVADANAIO")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(Color(red: 0.31, green: 0.42, blue: 0.45))
            }
            Text(euro(entry.data.total))
                .font(.system(size: family == .systemSmall ? 26 : 34, weight: .heavy))
                .foregroundColor(Color(red: 0.91, green: 0.63, blue: 0.24))
                .minimumScaleFactor(0.6)
                .lineLimit(1)
            Text("risparmiati in \(entry.data.days) giorni")
                .font(.system(size: 11))
                .foregroundColor(Color(red: 0.31, green: 0.42, blue: 0.45))
            if family != .systemSmall {
                HStack(spacing: 12) {
                    Text("oggi +\(euro(entry.data.today))")
                    Text("🔥 \(entry.data.streak) giorni di fila")
                }
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(Color(red: 0.05, green: 0.35, blue: 0.43))
                .padding(.top, 2)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .containerBackground(Color(red: 0.95, green: 0.97, blue: 0.98), for: .widget)
    }
}

struct PooliteWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "PooliteSalvadanaio", provider: SalvadanaioProvider()) { entry in
            SalvadanaioWidgetView(entry: entry)
        }
        .configurationDisplayName("Salvadanaio")
        .description("Gli euro che Poolite ti ha fatto risparmiare, sempre sott'occhio.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

@main
struct PooliteWidgetBundle: WidgetBundle {
    var body: some Widget {
        PooliteWidget()
    }
}
