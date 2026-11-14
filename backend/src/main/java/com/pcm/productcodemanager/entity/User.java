package com.pcm.productcodemanager.entity;

import com.pcm.productcodemanager.entity.enums.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(name = "username", length = 50, nullable = false, unique = true)
    private String username;

    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 20, nullable = false)
    @Builder.Default
    private Role role = Role.ADMIN;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}

