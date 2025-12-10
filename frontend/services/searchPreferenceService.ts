import axiosInstance from "@/lib/axios"
import type { ApiResponse } from "@/types/auth"
import type { SearchPreference, SearchPreferencePayload } from "@/types/searchPreference"

export async function fetchSearchPreferences() {
  const { data } = await axiosInstance.get<ApiResponse<SearchPreference[]>>("/preferences")
  return data.data || []
}

export async function createSearchPreference(payload: SearchPreferencePayload) {
  const { data } = await axiosInstance.post<ApiResponse<SearchPreference>>("/preferences", payload)
  return data.data
}

export async function deleteSearchPreference(id: string) {
  await axiosInstance.delete<ApiResponse<any>>(`/preferences/${id}`)
  return true
}
