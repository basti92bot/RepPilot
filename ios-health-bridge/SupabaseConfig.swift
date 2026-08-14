import Foundation
import Supabase

enum SupabaseConfig {
    static let client = SupabaseClient(
        supabaseURL: URL(string: "https://tpuufwcywwhrggfptzpi.supabase.co")!,
        supabaseKey: "sb_publishable_79GQl0jJBeQ8FKBj2TfnRw_JDyZf1oS"
    )
}
