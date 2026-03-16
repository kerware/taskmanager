package com.example.taskmanager.dto;

public record StatsDto(long todo, long inProgress, long done, long total) {

    public static StatsDto of(long todo, long inProgress, long done) {
        return new StatsDto(todo, inProgress, done, todo + inProgress + done);
    }
}
