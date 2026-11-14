package com.pcm.productcodemanager.mapper;

import com.pcm.productcodemanager.dto.response.UserResponse;
import com.pcm.productcodemanager.entity.User;
import com.pcm.productcodemanager.security.UserPrincipal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole() != null ? user.getRole().name() : null)")
    UserResponse toUserResponse(User user);

    @Mapping(target = "role", expression = "java(!userPrincipal.getAuthorities().isEmpty() ? userPrincipal.getAuthorities().iterator().next().getAuthority().replace(\"ROLE_\", \"\") : \"ADMIN\")")
    @Mapping(target = "isActive", source = "active")
    UserResponse toUserResponse(UserPrincipal userPrincipal);
}

