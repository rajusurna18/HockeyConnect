
package com.hockeyconnect.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "hockey_players",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_hockey_player_external_id",
            columnNames = "player_id"
        )
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "player_id", nullable = false, unique = true)
    private String playerId;

    @Column(nullable = false)
    private String name;

    private Integer age;

    private String position;

    private String teamId;

    private Integer jerseyNumber;
}
