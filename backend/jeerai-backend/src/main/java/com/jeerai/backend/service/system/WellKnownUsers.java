package com.jeerai.backend.service.system;

/**
 * Stable IDs for system-level actors.
 *
 * Note: These identifiers are also referenced by Flyway migrations.
 */
public final class WellKnownUsers {

    private WellKnownUsers() {
    }

    /**
     * Public ID for the system automation actor.
     *
     * See: V6__integration_channels.sql
     */
    public static final String AUTOMATION_ACTOR_PUBLIC_ID = "system-automation";
}
