class RuneVcs < Formula
  desc "Modern, intelligent version control system"
  homepage "https://github.com/Johan-Ott/rune-vcs"
  url "https://github.com/Johan-Ott/rune-vcs/releases/download/v0.3.2-alpha.6/rune-0.3.2-alpha.6-aarch64-apple-darwin.tar.gz"
  sha256 "287ca9250b499f7aac37b1f866136e7663bd66e26b708bd751fa56363b114377"
  license "Apache-2.0"
  version "0.3.2-alpha.6"

  # Currently only supports Apple Silicon Macs due to build constraints
  depends_on arch: :arm64

  def install
    bin.install "rune" => "rune-vcs"
  end

  test do
    system "#{bin}/rune-vcs", "--version"
    assert_match "rune #{version}", shell_output("#{bin}/rune-vcs --version")
  end
end
