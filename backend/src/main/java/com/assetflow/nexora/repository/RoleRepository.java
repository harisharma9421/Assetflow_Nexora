package com.assetflow.nexora.repository;

import com.assetflow.nexora.entity.Role;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Short> {
    Optional<Role> findByName(String name);
}
