package com.pcm.productcodemanager.mapper;

import com.pcm.productcodemanager.dto.response.ProductResponse;
import com.pcm.productcodemanager.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ProductMapper {

    @Mapping(target = "barcode", expression = "java(product.getBarcode() != null ? product.getBarcode().getBarcode() : null)")
    ProductResponse toProductResponse(Product product);

    List<ProductResponse> toProductResponseList(List<Product> products);
}

