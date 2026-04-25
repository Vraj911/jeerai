package com.jeerai.backend.config;
import java.util.ArrayList;
import java.util.List;
import com.jeerai.backend.model.Activity;
import com.jeerai.backend.model.AppNotification;
import com.jeerai.backend.model.AutomationRule;
import com.jeerai.backend.model.Issue;
import com.jeerai.backend.model.IssueComment;
import com.jeerai.backend.model.Project;
import com.jeerai.backend.model.Sprint;
import com.jeerai.backend.model.User;
import lombok.Data;
@Data
public class MockDataPayload {
    private List<User> users = new ArrayList<>();
    private List<Project> projects = new ArrayList<>();
    private List<Sprint> sprints = new ArrayList<>();
    private List<Issue> issues = new ArrayList<>();
    private List<IssueComment> comments = new ArrayList<>();
    private List<Activity> activities = new ArrayList<>();
    private List<AppNotification> notifications = new ArrayList<>();
    private List<AutomationRule> automationRules = new ArrayList<>();
}
