
package com.hockeyconnect.repository;

import com.hockeyconnect.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Long> {

    Optional<Player> findByPlayerId(String playerId);

    boolean existsByPlayerId(String playerId);

    List<Player> findByTeamId(String teamId);

    List<Player> findByPositionIgnoreCase(String position);
}
