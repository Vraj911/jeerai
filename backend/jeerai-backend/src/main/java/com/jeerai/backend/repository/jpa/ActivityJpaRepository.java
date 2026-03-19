package com.jeerai.backend.repository.jpa;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jeerai.backend.entity.ActivityEntity;

public interface ActivityJpaRepository extends JpaRepository<ActivityEntity, UUID> {
    List<ActivityEntity> findByProject_PublicId(String projectId);
}
