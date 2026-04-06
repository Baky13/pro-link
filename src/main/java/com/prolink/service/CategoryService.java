package com.prolink.service;

import com.prolink.dto.CategoryDto;
import com.prolink.entity.Category;
import com.prolink.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryDto> getAllWithChildren() {
        return categoryRepository.findByParentIsNull().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private CategoryDto toDto(Category c) {
        CategoryDto dto = new CategoryDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setSlug(c.getSlug());
        dto.setIcon(c.getIcon());
        dto.setParentId(c.getParent() != null ? c.getParent().getId() : null);
        if (c.getChildren() != null && !c.getChildren().isEmpty()) {
            dto.setChildren(c.getChildren().stream().map(this::toDto).collect(Collectors.toList()));
        }
        return dto;
    }
}
