class RuneVcs < Formula
  desc "Rune - Modern, intelligent version control system"
  homepage "https://github.com/Johan-Ott/rune-vcs"
  version "0.3.5-alpha.1"
  license "Apache-2.0"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/Johan-Ott/rune-vcs/releases/download/v0.3.5-alpha.1/rune-v0.3.5-alpha.1-aarch64-apple-darwin.tar.gz"
      sha256 "9ad3a8cf177468b7a9901005e483a32dac190ae3b93208f84d8bb4b7e78c4ed7"
    else
      url "https://github.com/Johan-Ott/rune-vcs/releases/download/v0.3.5-alpha.1/rune-v0.3.5-alpha.1-x86_64-apple-darwin.tar.gz"
      sha256 "2dd5c5a21b29b8571dc4ae768e250371df643e364acc49f527372c56dd7785fa"
    end
  end

  on_linux do
    if Hardware::CPU.arm? && Hardware::CPU.arch == :aarch64
      url "https://github.com/Johan-Ott/rune-vcs/releases/download/v0.3.5-alpha.1/rune-v0.3.5-alpha.1-aarch64-unknown-linux-gnu.tar.gz"
      sha256 "b89397eaacbd4d94762595d1411329f8bdb22c6b0a90cbf508f74248f9ddaac1"
    end

    if Hardware::CPU.intel?
      url "https://github.com/Johan-Ott/rune-vcs/releases/download/v0.3.5-alpha.1/rune-v0.3.5-alpha.1-x86_64-unknown-linux-gnu.tar.gz"
      sha256 "f0f335466813f082fd8920d06232e38d7fbf19abd13e01d1418d7156351859d2"
    end
  end

  depends_on "git"

  def install
    bin.install "rune"
    
    # Install shell completions if they exist
    if File.exist?("rune.bash")
      bash_completion.install "rune.bash" => "rune"
    end
    if File.exist?("rune.zsh")
      zsh_completion.install "rune.zsh" => "_rune"
    end
    if File.exist?("rune.fish")
      fish_completion.install "rune.fish"
    end
  end

  test do
    system "#{bin}/rune", "version"
    
    # Test basic functionality
    system "#{bin}/rune", "help"
  end
end
