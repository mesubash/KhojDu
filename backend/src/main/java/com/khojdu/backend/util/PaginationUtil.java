package com.khojdu.backend.util;

import com.khojdu.backend.dto.common.PagedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;

public class PaginationUtil {

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    public static Pageable createPageable(Integer page, Integer size, String sortBy, String sortDirection) {
        int pageNumber = page != null && page >= 0 ? page : 0;
        int pageSize = size != null && size > 0 && size <= MAX_PAGE_SIZE ? size : DEFAULT_PAGE_SIZE;

        Sort sort = Sort.unsorted();
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            Sort.Direction direction = Sort.Direction.ASC;
            if ("DESC".equalsIgnoreCase(sortDirection)) {
                direction = Sort.Direction.DESC;
            }
            sort = Sort.by(direction, sortBy);
        }

        return PageRequest.of(pageNumber, pageSize, sort);
    }

    public static <T> PagedResponse<T> createPagedResponse(Page<T> page) {
        return PagedResponse.of(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    public static <T, R> PagedResponse<R> createPagedResponse(Page<T> page, List<R> mappedContent) {
        return PagedResponse.of(
                mappedContent,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    public static boolean isValidPageSize(Integer size) {
        return size != null && size > 0 && size <= MAX_PAGE_SIZE;
    }

    public static boolean isValidPageNumber(Integer page) {
        return page != null && page >= 0;
    }
}
