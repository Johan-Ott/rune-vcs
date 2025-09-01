// Simple performance optimization module for Rune VCS
pub mod simple;
pub mod advanced;
pub mod network_storage;
pub mod monitoring;
pub mod large_repo_optimization;

// Re-export for convenience
pub use simple::{PerformanceEngine, PerformanceMetrics, SimpleCache};
pub use advanced::{AdvancedPerformanceEngine, AdvancedMetrics, PerformanceConfig};
pub use network_storage::{NetworkStorageEngine, TransferStats, DeltaResult, StreamConfig};
pub use monitoring::{
    PerformanceMonitor, BenchmarkResult, PerformanceBottleneck, BottleneckSeverity,
    PerformanceReport, MetricSnapshot, TrendDirection, TrendSignificance, PerformanceTrend
};
pub use large_repo_optimization::{
    LargeRepoOptimizer, LargeRepoConfig, LoadingReport, ProcessingResult, 
    MemoryOptimizationReport, PerformanceMetrics as LargeRepoMetrics
};
