import axiosInstance from "@/lib/axios"
import type { ApiResponse } from "@/types/auth"
import type { Complaint, ComplaintPriority, ComplaintStatus, ComplaintType } from "@/types/complaint"
import type { PagedResponse } from "@/types/property"

export interface ComplaintPayload {
  propertyId?: string
  landlordId?: string
  complaintType: ComplaintType
  subject: string
  description: string
  evidenceUrls?: string[]
}

export async function createComplaint(payload: ComplaintPayload) {
  const { data } = await axiosInstance.post<ApiResponse<Complaint>>("/complaints", payload)
  return data.data
}

export async function fetchMyComplaints(params: { page?: number; size?: number } = {}) {
  const { page = 0, size = 10 } = params
  const query = new URLSearchParams({ page: String(page), size: String(size) })
  const { data } = await axiosInstance.get<ApiResponse<PagedResponse<Complaint>>>(`/complaints/my-complaints?${query.toString()}`)
  return data.data
}

export interface ComplaintUpdatePayload {
  status?: ComplaintStatus
  priority?: ComplaintPriority
  assignedTo?: string
  resolutionNotes?: string
}

export async function updateComplaint(complaintId: string, payload: ComplaintUpdatePayload) {
  const { data } = await axiosInstance.put<ApiResponse<Complaint>>(`/complaints/${complaintId}`, payload)
  return data.data
}

export async function fetchComplaint(complaintId: string) {
  const { data } = await axiosInstance.get<ApiResponse<Complaint>>(`/complaints/${complaintId}`)
  return data.data
}
