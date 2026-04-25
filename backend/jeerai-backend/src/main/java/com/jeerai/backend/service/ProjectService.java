package com.jeerai.backend.service;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.jeerai.backend.dto.ProjectCreateRequest;
import com.jeerai.backend.dto.ProjectDto;
import com.jeerai.backend.dto.ProjectUpdateRequest;
import com.jeerai.backend.dto.UserDto;
import com.jeerai.backend.model.Project;
import com.jeerai.backend.model.User;
import com.jeerai.backend.repository.ProjectRepository;
import com.jeerai.backend.repository.UserRepository;
import com.jeerai.backend.security.CurrentUserProvider;
@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final WorkspaceAccessService workspaceAccessService;
    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;
    public ProjectService(
            ProjectRepository projectRepository,
            WorkspaceAccessService workspaceAccessService,
            UserRepository userRepository,
            CurrentUserProvider currentUserProvider) {
        this.projectRepository = projectRepository;
        this.workspaceAccessService = workspaceAccessService;
        this.userRepository = userRepository;
        this.currentUserProvider = currentUserProvider;
    }
    public List<ProjectDto> getAll() {
        var accessibleWorkspaceIds = workspaceAccessService.getAccessibleWorkspaceIds();
        return projectRepository.findAll().stream()
                .filter(project -> project.getWorkspaceId() != null && accessibleWorkspaceIds.contains(project.getWorkspaceId()))
                .sorted(Comparator.comparing(Project::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    public ProjectDto create(ProjectCreateRequest request) {
        if (request.getWorkspaceId() == null || request.getWorkspaceId().isBlank()) {
            throw new BadRequestException("Workspace is required");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Project name is required");
        }
        if (request.getKey() == null || request.getKey().isBlank()) {
            throw new BadRequestException("Project key is required");
        }
        workspaceAccessService.requireWorkspaceAdminAccess(request.getWorkspaceId());
        String normalizedKey = request.getKey().trim().toUpperCase();
    boolean duplicateKey = projectRepository.findAll().stream()
        .filter(project -> request.getWorkspaceId().equals(project.getWorkspaceId()))
        .anyMatch(project -> normalizedKey.equalsIgnoreCase(project.getKey()));
        if (duplicateKey) {
            throw new BadRequestException("Project key already exists");
        }
        User lead = userRepository.findById(currentUserProvider.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        Instant now = Instant.now();
        Project project = new Project(
                UUID.randomUUID().toString(),
                normalizedKey,
                request.getName().trim(),
                request.getDescription() == null ? "" : request.getDescription().trim(),
                lead,
                List.of(lead),
                now,
                now,
                request.getWorkspaceId());
        return toDto(projectRepository.save(project));
    }
    public ProjectDto getById(String id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        workspaceAccessService.requireProjectReadAccess(project.getId());
        return toDto(project);
    }
    public ProjectDto update(String id, ProjectUpdateRequest request) {
        workspaceAccessService.requireProjectAdminAccess(id);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (request.getName() != null) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        project.setUpdatedAt(Instant.now());
        Project saved = projectRepository.save(project);
        return toDto(saved);
    }
    private ProjectDto toDto(Project project) {
        return new ProjectDto(
                project.getId(),
                project.getKey(),
                project.getName(),
                project.getDescription(),
                toUserDto(project.getLead()),
                project.getMembers() == null ? List.of() : project.getMembers().stream().map(this::toUserDto).toList(),
                project.getCreatedAt(),
                project.getUpdatedAt());
    }
    private UserDto toUserDto(User user) {
        if (user == null) return null;
        return new UserDto(user.getId(), user.getName(), user.getEmail());
    }
}
