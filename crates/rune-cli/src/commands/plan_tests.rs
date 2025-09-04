#[cfg(test)]
mod team_management_tests {
    use super::*;
    use std::collections::HashMap;
    use tempfile::TempDir;
    
    fn setup_test_workspace() -> TempDir {
        let temp_dir = TempDir::new().unwrap();
        let rune_dir = temp_dir.path().join(".rune");
        std::fs::create_dir_all(&rune_dir).unwrap();
        temp_dir
    }
    
    #[test]
    fn test_create_team() {
        let temp_dir = setup_test_workspace();
        let root = temp_dir.path();
        
        let cmd = TeamsCmd::Create {
            name: "Test Team".to_string(),
            description: Some("A test team".to_string()),
            members: Some("Alice,Bob".to_string()),
        };
        
        let result = handle_teams_command(cmd, root);
        assert!(result.is_ok());
        
        // Verify team was created
        let teams_file = root.join(".rune").join("teams.json");
        assert!(teams_file.exists());
        
        let content = std::fs::read_to_string(&teams_file).unwrap();
        let teams: HashMap<String, serde_json::Value> = serde_json::from_str(&content).unwrap();
        
        assert!(teams.contains_key("Test Team"));
        let team = &teams["Test Team"];
        assert_eq!(team["description"].as_str().unwrap(), "A test team");
        
        let members = team["members"].as_array().unwrap();
        assert_eq!(members.len(), 2);
        assert!(members.iter().any(|m| m.as_str() == Some("Alice")));
        assert!(members.iter().any(|m| m.as_str() == Some("Bob")));
    }
    
    #[test]
    fn test_add_remove_member() {
        let temp_dir = setup_test_workspace();
        let root = temp_dir.path();
        
        // Create team first
        let create_cmd = TeamsCmd::Create {
            name: "Test Team".to_string(),
            description: None,
            members: Some("Alice".to_string()),
        };
        handle_teams_command(create_cmd, root).unwrap();
        
        // Add member
        let add_cmd = TeamsCmd::AddMember {
            team: "Test Team".to_string(),
            member: "Bob".to_string(),
        };
        let result = handle_teams_command(add_cmd, root);
        assert!(result.is_ok());
        
        // Verify member was added
        let teams_file = root.join(".rune").join("teams.json");
        let content = std::fs::read_to_string(&teams_file).unwrap();
        let teams: HashMap<String, serde_json::Value> = serde_json::from_str(&content).unwrap();
        let members = teams["Test Team"]["members"].as_array().unwrap();
        assert_eq!(members.len(), 2);
        
        // Remove member
        let remove_cmd = TeamsCmd::RemoveMember {
            team: "Test Team".to_string(),
            member: "Bob".to_string(),
        };
        let result = handle_teams_command(remove_cmd, root);
        assert!(result.is_ok());
        
        // Verify member was removed
        let content = std::fs::read_to_string(&teams_file).unwrap();
        let teams: HashMap<String, serde_json::Value> = serde_json::from_str(&content).unwrap();
        let members = teams["Test Team"]["members"].as_array().unwrap();
        assert_eq!(members.len(), 1);
        assert!(members.iter().any(|m| m.as_str() == Some("Alice")));
    }
    
    #[test]
    fn test_set_team_lead() {
        let temp_dir = setup_test_workspace();
        let root = temp_dir.path();
        
        // Create team first
        let create_cmd = TeamsCmd::Create {
            name: "Test Team".to_string(),
            description: None,
            members: Some("Alice,Bob".to_string()),
        };
        handle_teams_command(create_cmd, root).unwrap();
        
        // Set lead
        let lead_cmd = TeamsCmd::SetLead {
            team: "Test Team".to_string(),
            lead: "Alice".to_string(),
        };
        let result = handle_teams_command(lead_cmd, root);
        assert!(result.is_ok());
        
        // Verify lead was set
        let teams_file = root.join(".rune").join("teams.json");
        let content = std::fs::read_to_string(&teams_file).unwrap();
        let teams: HashMap<String, serde_json::Value> = serde_json::from_str(&content).unwrap();
        assert_eq!(teams["Test Team"]["lead"].as_str().unwrap(), "Alice");
    }
}

#[cfg(test)]
mod analytics_tests {
    use super::*;
    use rune_planning::{Plan, PlanType, PlanStatus, Priority};
    use chrono::Utc;
    use tempfile::TempDir;
    
    fn create_test_plan(id: &str, title: &str, status: PlanStatus, plan_type: PlanType) -> Plan {
        Plan {
            id: id.to_string(),
            title: title.to_string(),
            status,
            priority: Priority::Medium,
            plan_type,
            release: None,
            owners: vec![],
            tags: vec![],
            effort: Some(5),
            project: None,
            epic: None,
            story: None,
            created: Utc::now(),
            updated: Utc::now(),
            goals: vec![],
            user_stories: vec![],
            tasks: vec![],
            acceptance_criteria: vec![],
            dependencies: vec![],
            blocks: vec![],
            roots: vec![],
            description: "Test description".to_string(),
        }
    }
    
    #[test]
    fn test_cycle_health_calculation() {
        let temp_dir = TempDir::new().unwrap();
        let root = temp_dir.path();
        
        // Create test plans with different statuses
        let store = rune_planning::PlanStore::new(root);
        store.ensure().unwrap();
        
        let plan1 = create_test_plan("TEST-001", "Completed", PlanStatus::Done, PlanType::Story);
        let plan2 = create_test_plan("TEST-002", "In Progress", PlanStatus::InProgress, PlanType::Story);
        let plan3 = create_test_plan("TEST-003", "Blocked", PlanStatus::Blocked, PlanType::Story);
        let plan4 = create_test_plan("TEST-004", "Planned", PlanStatus::Planned, PlanType::Story);
        
        store.save(&plan1).unwrap();
        store.save(&plan2).unwrap();
        store.save(&plan3).unwrap();
        store.save(&plan4).unwrap();
        
        // Test cycle health command
        let cmd = AnalyticsCmd::CycleHealth { cycle: None };
        let result = handle_analytics_command(cmd, root);
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_blocked_items_detection() {
        let temp_dir = TempDir::new().unwrap();
        let root = temp_dir.path();
        
        let store = rune_planning::PlanStore::new(root);
        store.ensure().unwrap();
        
        let blocked_plan = create_test_plan("TEST-001", "Blocked Item", PlanStatus::Blocked, PlanType::Task);
        let normal_plan = create_test_plan("TEST-002", "Normal Item", PlanStatus::Planned, PlanType::Task);
        
        store.save(&blocked_plan).unwrap();
        store.save(&normal_plan).unwrap();
        
        let cmd = AnalyticsCmd::Blocked;
        let result = handle_analytics_command(cmd, root);
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_dependency_analysis() {
        let temp_dir = TempDir::new().unwrap();
        let root = temp_dir.path();
        
        let store = rune_planning::PlanStore::new(root);
        store.ensure().unwrap();
        
        let mut plan1 = create_test_plan("TEST-001", "Dependency", PlanStatus::Planned, PlanType::Story);
        let mut plan2 = create_test_plan("TEST-002", "Dependent", PlanStatus::Planned, PlanType::Story);
        
        // Make plan2 depend on plan1
        plan2.dependencies.push("TEST-001".to_string());
        
        store.save(&plan1).unwrap();
        store.save(&plan2).unwrap();
        
        let cmd = AnalyticsCmd::Dependencies { id: "TEST-001".to_string() };
        let result = handle_analytics_command(cmd, root);
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_bottleneck_detection() {
        let temp_dir = TempDir::new().unwrap();
        let root = temp_dir.path();
        
        let store = rune_planning::PlanStore::new(root);
        store.ensure().unwrap();
        
        let bottleneck = create_test_plan("BOTTLE-001", "Bottleneck", PlanStatus::InProgress, PlanType::Epic);
        let mut dependent1 = create_test_plan("DEP-001", "Dependent 1", PlanStatus::Planned, PlanType::Story);
        let mut dependent2 = create_test_plan("DEP-002", "Dependent 2", PlanStatus::Planned, PlanType::Story);
        
        dependent1.dependencies.push("BOTTLE-001".to_string());
        dependent2.dependencies.push("BOTTLE-001".to_string());
        
        store.save(&bottleneck).unwrap();
        store.save(&dependent1).unwrap();
        store.save(&dependent2).unwrap();
        
        let cmd = AnalyticsCmd::Bottlenecks;
        let result = handle_analytics_command(cmd, root);
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_risk_assessment() {
        let temp_dir = TempDir::new().unwrap();
        let root = temp_dir.path();
        
        let store = rune_planning::PlanStore::new(root);
        store.ensure().unwrap();
        
        // Create a critical blocked item to trigger risk detection
        let mut critical_blocked = create_test_plan("CRIT-001", "Critical Blocked", PlanStatus::Blocked, PlanType::Epic);
        critical_blocked.priority = Priority::Critical;
        
        store.save(&critical_blocked).unwrap();
        
        let cmd = AnalyticsCmd::Risk;
        let result = handle_analytics_command(cmd, root);
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_forecast_with_no_velocity() {
        let temp_dir = TempDir::new().unwrap();
        let root = temp_dir.path();
        
        let store = rune_planning::PlanStore::new(root);
        store.ensure().unwrap();
        
        let plan = create_test_plan("TEST-001", "Test Plan", PlanStatus::Planned, PlanType::Story);
        store.save(&plan).unwrap();
        
        let cmd = AnalyticsCmd::Forecast { days: Some(30) };
        let result = handle_analytics_command(cmd, root);
        assert!(result.is_ok());
    }
}
