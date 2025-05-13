{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    prisma-utils.url = "github:VanCoding/nix-prisma-utils";
  };

  outputs = {
    nixpkgs,
    prisma-utils,
    ...
  }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
    prisma =
      (prisma-utils.lib.prisma-factory {
        inherit pkgs;
        # just copy these hashes for now, and then change them when nix complains about the mismatch
        prisma-fmt-hash = "sha256-8JgONBjMiCENc4l/OI1fDvBGncHNPotCTyAsLlrSdMI=";
        query-engine-hash = "sha256-GAl6ZLfaOqc5XSgoyPUzKsVbQ++QtqEp0haMKoORf4I=";
        libquery-engine-hash = "sha256-3fx3OIeLerUBTZzKeVQ94osIeQ0cq63qTDG4z8LU5B8=";
        schema-engine-hash = "sha256-5ajaA8jklEGYqNHsBOe8zwJmNrqV7vUkIqT0F5tNUKg=";
      }).fromNpmLock
      ./package-lock.json; # <--- path to our package-lock.json file that contains the version of prisma-engines
  in {
    devShells.${system}.default = pkgs.mkShell {
      buildInputs = with pkgs; [
        openssl
      ];
      env = prisma.env;
      # or, you can use `shellHook` instead of `env` to load the same environment variables.
      # shellHook = prisma.shellHook;
    };
  };
}
