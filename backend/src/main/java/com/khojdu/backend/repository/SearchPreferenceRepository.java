package com.khojdu.backend.repository;

import com.khojdu.backend.entity.SearchPreference;
import com.khojdu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SearchPreferenceRepository extends JpaRepository<SearchPreference, UUID> {
    List<SearchPreference> findByUser(User user);
}
