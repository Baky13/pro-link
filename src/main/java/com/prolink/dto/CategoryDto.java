package com.prolink.dto;

import lombok.Data;
import java.util.List;

@Data
public class CategoryDto {
    private Long id;
    private String name;
    private String slug;
    private String icon;
    private Long parentId;
    private List<CategoryDto> children;
}
