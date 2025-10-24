package com.khojdu.backend.repository;

import com.khojdu.backend.entity.AppSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppSettingRepository extends JpaRepository<AppSetting, String> {

    @Query("SELECT s.value FROM AppSetting s WHERE s.key = :key")
    Optional<String> findValueByKey(@Param("key") String key);

    default String getValueOrDefault(String key, String defaultValue) {
        return findValueByKey(key).orElse(defaultValue);
    }

    default Integer getIntValueOrDefault(String key, Integer defaultValue) {
        return findValueByKey(key)
                .map(Integer::valueOf)
                .orElse(defaultValue);
    }

    default Boolean getBooleanValueOrDefault(String key, Boolean defaultValue) {
        return findValueByKey(key)
                .map(Boolean::valueOf)
                .orElse(defaultValue);
    }
}
