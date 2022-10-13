{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [ nodejs-18_x ];

  shellHook = ''
    export PATH=$PWD/node_modules/.bin:$PATH
  '';
}
