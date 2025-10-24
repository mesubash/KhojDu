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

    List<SearchPreference> findByUserId(UUID userId);

    // Use explicit operator to avoid 'Matches' being interpreted as a keyword
    List<SearchPreference> findByUserAndNotifyNewMatchesEquals(User user, boolean notifyNewMatches);

    List<SearchPreference> findByUserAndNotifyPriceDropsEquals(User user, boolean notifyPriceDrops);

    // Simpler forms for the common true-case
    List<SearchPreference> findByUserAndNotifyNewMatchesTrue(User user);

    List<SearchPreference> findByUserAndNotifyPriceDropsTrue(User user);
}
