package com.assetflow.nexora.repository;

import com.assetflow.nexora.entity.User;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByDepartmentId(Long departmentId);
}
