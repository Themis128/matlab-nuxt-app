{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.npm
    pkgs.nodePackages.typescript
    pkgs.nodePackages.typescript-language-server
    # Python support (for prediction API)
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.python311Packages.numpy
    pkgs.python311Packages.scipy
    pkgs.python311Packages.pandas
    pkgs.python311Packages.scikit-learn
    # Git
    pkgs.git
    # Build tools
    pkgs.make
    pkgs.gnumake
    # Shell utilities
    pkgs.bash
  ];
}
