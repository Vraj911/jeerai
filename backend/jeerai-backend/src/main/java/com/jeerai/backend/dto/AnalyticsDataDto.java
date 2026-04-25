package com.jeerai.backend.dto;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDataDto {
    private List<StatusCount> issuesByStatus = new ArrayList<>();
    private List<CompletionBucket> completionData = new ArrayList<>();
    private List<VelocityBucket> velocityData = new ArrayList<>();
    private List<WorkloadBucket> workloadData = new ArrayList<>();
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusCount {
        private String status;
        private int count;
    }
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompletionBucket {
        private String week;
        private int completed;
    }
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VelocityBucket {
        private String sprint;
        private int completed;
    }
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkloadBucket {
        private String name;
        private int todo;
        private int inProgress;
        private int review;
        private int done;
    }
}
