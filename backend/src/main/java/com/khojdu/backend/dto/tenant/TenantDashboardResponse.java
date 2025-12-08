package com.khojdu.backend.dto.tenant;

import com.khojdu.backend.dto.property.PropertyListResponse;
import com.khojdu.backend.dto.inquiry.InquiryResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantDashboardResponse {
    private long wishlistCount;
    private long inquiryCount;
    private List<PropertyListResponse> recentWishlist;
    private List<InquiryResponse> recentInquiries;
}
