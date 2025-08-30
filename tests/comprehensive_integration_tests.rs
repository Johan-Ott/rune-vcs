use rune_cli::*;
use std::process::Command;
use tempfile::TempDir;

/// Integration tests for AI-powered features
/// Testing the revolutionary AI capabilities that make Rune VCS unique

#[cfg(test)]
mod ai_integration_tests {
    use super::*;

    #[test]
    fn test_ai_binary_analysis_integration() {
        // Test the AI binary analysis command end-to-end
        let temp_dir = TempDir::new().unwrap();
        
        // Create a test repository with binary files
        std::fs::write(
            temp_dir.path().join("large_binary.bin"),
            vec![0u8; 10 * 1024 * 1024], // 10MB file
        ).unwrap();
        
        let output = Command::new("cargo")
            .args(&["run", "--bin", "rune", "--", "binary", "analyze"])
            .current_dir(temp_dir.path())
            .output()
            .expect("Failed to execute rune binary analyze");
            
        assert!(output.status.success(), "Binary analysis should complete successfully");
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        assert!(stdout.contains("Binary Analysis Summary"), "Should show analysis summary");
        assert!(stdout.contains("LFS candidates"), "Should identify LFS candidates");
    }

    #[test]
    fn test_natural_language_interface() {
        // Test natural language commands work as expected
        let temp_dir = TempDir::new().unwrap();
        
        // Initialize a test repository
        Command::new("cargo")
            .args(&["run", "--bin", "rune", "--", "init"])
            .current_dir(temp_dir.path())
            .output()
            .expect("Failed to initialize repository");
            
        // Test the "changed" natural language command
        let output = Command::new("cargo")
            .args(&["run", "--bin", "rune", "--", "changed"])
            .current_dir(temp_dir.path())
            .output()
            .expect("Failed to execute rune changed");
            
        assert!(output.status.success(), "Natural language command should work");
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        assert!(stdout.contains("What Changed"), "Should show natural language response");
    }

    #[test]
    fn test_ai_smart_branch_functionality() {
        let temp_dir = TempDir::new().unwrap();
        
        // Initialize repository
        Command::new("cargo")
            .args(&["run", "--bin", "rune", "--", "init"])
            .current_dir(temp_dir.path())
            .output()
            .unwrap();
            
        // Test smart-branch command
        let output = Command::new("cargo")
            .args(&["run", "--bin", "rune", "--", "smart-branch", "--help"])
            .current_dir(temp_dir.path())
            .output()
            .expect("Failed to execute smart-branch help");
            
        assert!(output.status.success(), "Smart branch help should work");
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        assert!(stdout.contains("Intelligent branching"), "Should show AI branching description");
    }

    #[test]
    fn test_performance_optimization_commands() {
        let temp_dir = TempDir::new().unwrap();
        
        // Test the optimize command
        let output = Command::new("cargo")
            .args(&["run", "--bin", "rune", "--", "optimize", "--help"])
            .current_dir(temp_dir.path())
            .output()
            .expect("Failed to execute optimize help");
            
        assert!(output.status.success(), "Optimize command should work");
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        assert!(stdout.contains("repository"), "Should mention repository optimization");
    }

    #[test]
    fn test_revolutionary_workflow_commands() {
        let temp_dir = TempDir::new().unwrap();
        
        // Test revolutionary workflow commands exist and work
        let commands = vec!["work", "ship", "sync", "explore", "flow"];
        
        for cmd in commands {
            let output = Command::new("cargo")
                .args(&["run", "--bin", "rune", "--", cmd, "--help"])
                .current_dir(temp_dir.path())
                .output()
                .expect(&format!("Failed to execute {} help", cmd));
                
            assert!(output.status.success(), "{} command should work", cmd);
            
            let stdout = String::from_utf8_lossy(&output.stdout);
            assert!(stdout.contains("Smart") || stdout.contains("workflow"), 
                   "{} should show smart workflow description", cmd);
        }
    }

    #[test]
    fn test_ai_intelligence_features() {
        let temp_dir = TempDir::new().unwrap();
        
        // Test intelligence command
        let output = Command::new("cargo")
            .args(&["run", "--bin", "rune", "--", "intelligence", "--help"])
            .current_dir(temp_dir.path())
            .output()
            .expect("Failed to execute intelligence help");
            
        assert!(output.status.success(), "Intelligence command should work");
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        assert!(stdout.contains("Intelligent") || stdout.contains("analysis"), 
               "Should show AI intelligence description");
    }

    #[test]
    fn test_enterprise_ready_features() {
        // Test enterprise features are available
        let enterprise_commands = vec!["guard", "dashboard", "auto-flow"];
        
        for cmd in enterprise_commands {
            let output = Command::new("cargo")
                .args(&["run", "--bin", "rune", "--", cmd, "--help"])
                .output()
                .expect(&format!("Failed to execute {} help", cmd));
                
            assert!(output.status.success(), "{} enterprise command should work", cmd);
        }
    }
}

/// Performance regression tests
/// Ensures AI features don't impact core VCS performance
#[cfg(test)]
mod performance_regression_tests {
    use super::*;
    use std::time::Instant;

    #[test]
    fn test_status_command_performance() {
        let temp_dir = TempDir::new().unwrap();
        
        // Initialize repository and add files
        Command::new("cargo")
            .args(&["run", "--bin", "rune", "--", "init"])
            .current_dir(temp_dir.path())
            .output()
            .unwrap();
            
        // Create multiple files to test performance
        for i in 0..100 {
            std::fs::write(
                temp_dir.path().join(format!("file_{}.txt", i)),
                format!("Content of file {}", i),
            ).unwrap();
        }
        
        let start = Instant::now();
        let output = Command::new("cargo")
            .args(&["run", "--bin", "rune", "--", "status"])
            .current_dir(temp_dir.path())
            .output()
            .expect("Failed to execute status");
            
        let duration = start.elapsed();
        
        assert!(output.status.success(), "Status should complete successfully");
        assert!(duration.as_millis() < 5000, "Status should complete within 5 seconds");
    }

    #[test]
    fn test_binary_analysis_performance() {
        let temp_dir = TempDir::new().unwrap();
        
        // Create medium-sized binary files
        for i in 0..10 {
            std::fs::write(
                temp_dir.path().join(format!("binary_{}.bin", i)),
                vec![i as u8; 1024 * 1024], // 1MB each
            ).unwrap();
        }
        
        let start = Instant::now();
        let output = Command::new("cargo")
            .args(&["run", "--bin", "rune", "--", "binary", "analyze"])
            .current_dir(temp_dir.path())
            .output()
            .expect("Failed to execute binary analyze");
            
        let duration = start.elapsed();
        
        assert!(output.status.success(), "Binary analysis should complete");
        assert!(duration.as_millis() < 10000, "Binary analysis should complete within 10 seconds");
    }
}

/// Security integration tests
/// Validates security features work correctly
#[cfg(test)]
mod security_integration_tests {
    use super::*;

    #[test]
    fn test_no_sensitive_data_in_help() {
        // Ensure help text doesn't leak sensitive information
        let output = Command::new("cargo")
            .args(&["run", "--bin", "rune", "--", "--help"])
            .output()
            .expect("Failed to execute help");
            
        let stdout = String::from_utf8_lossy(&output.stdout);
        
        // Check for potential sensitive data patterns
        assert!(!stdout.to_lowercase().contains("password"));
        assert!(!stdout.to_lowercase().contains("secret"));
        assert!(!stdout.to_lowercase().contains("token"));
        assert!(!stdout.to_lowercase().contains("key"));
    }

    #[test]
    fn test_security_command_availability() {
        // Test security-related commands are available
        let output = Command::new("cargo")
            .args(&["run", "--bin", "rune", "--", "--help"])
            .output()
            .expect("Failed to execute help");
            
        let stdout = String::from_utf8_lossy(&output.stdout);
        
        // Should have security features available
        assert!(stdout.contains("guard") || stdout.contains("security"), 
               "Should have security-related commands");
    }
}

/// Compatibility tests
/// Ensures Rune VCS maintains compatibility with git workflows
#[cfg(test)]
mod compatibility_tests {
    use super::*;

    #[test]
    fn test_basic_git_workflow_compatibility() {
        let temp_dir = TempDir::new().unwrap();
        
        // Test basic git-like workflow works
        let commands = vec![
            vec!["init"],
            vec!["status"],
            vec!["--help"],
        ];
        
        for cmd_args in commands {
            let output = Command::new("cargo")
                .args(&["run", "--bin", "rune", "--"])
                .args(&cmd_args)
                .current_dir(temp_dir.path())
                .output()
                .expect(&format!("Failed to execute rune {:?}", cmd_args));
                
            assert!(output.status.success(), 
                   "Command {:?} should work for git compatibility", cmd_args);
        }
    }

    #[test]
    fn test_version_information() {
        let output = Command::new("cargo")
            .args(&["run", "--bin", "rune", "--", "--version"])
            .output()
            .expect("Failed to execute version");
            
        assert!(output.status.success(), "Version command should work");
        
        let stdout = String::from_utf8_lossy(&output.stdout);
        assert!(stdout.contains("rune"), "Should show rune in version output");
    }
}
