class Rune < Formula
  desc "Rune - Modern, intelligent version control system"
  homepage "https://github.com/Johan-Ott/rune-vcs"
  url "https://github.com/Johan-Ott/rune-vcs/releases/download/v0.3.2-alpha.6/rune-0.3.2-alpha.6-aarch64-apple-darwin.tar.gz"
  sha256 "287ca9250b499f7aac37b1f866136e7663bd66e26b708bd751fa56363b114377"
  license "Apache-2.0"
  version "0.3.2-alpha.6"

  depends_on "git"

  def install
    bin.install "rune"
    
    # Install shell completions
    bash_completion.install "rune.bash" => "rune"
    zsh_completion.install "rune.zsh" => "_rune"
    fish_completion.install "rune.fish"
  end

  test do
    system "#{bin}/rune", "version"
    
    # Test basic functionality
    system "#{bin}/rune", "help"
  end
end
