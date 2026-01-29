#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# comando para gerar o documento do projeto: python gerar_documentacao.py

"""
Gerador de Documentação de Projeto
Gera um arquivo de texto com a estrutura completa do projeto,
incluindo pastas, arquivos e conteúdo dos arquivos.
Permite escolher apenas caminhos específicos, incluindo subpastas aninhadas
como "src/components".
"""

import os
import datetime
from pathlib import Path


# ---------------------------------------------------------------
# CONFIGURAÇÃO: Informe os caminhos que deseja documentar
# Exemplo: ["src"] ou ["src", "backend"]
# Para subpastas aninhadas, use: ["src/components"]
# ---------------------------------------------------------------
TARGET_SUBFOLDERS = ["."]  # Configure o caminho desejado aqui
# ---------------------------------------------------------------


def should_ignore_path(path_name):
    """
    Define quais pastas e arquivos devem ser ignorados
    """
    ignore_patterns = {
        'venv', 'env', '.venv', '.env',
        'node_modules', 'vendor', 'packages',
        '__pycache__', '.pytest_cache', '.mypy_cache',
        'build', 'dist', '.build', '.dist',
        'target', 'bin', 'obj', '.gitignore',
        '.git', '.svn', '.hg', '.bzr',
        '.vscode', '.idea', '.vs', '.eclipse',
        'logs', 'log', '.logs', 'temp', 'tmp', '.tmp',
        '.next', '.nuxt', '.output', 'coverage',
        '.nyc_output', '.sass-cache'
    }

    ignore_files = {
        '.gitignore', '.dockerignore', '.env.example',
        'package-lock.json', 'yarn.lock', 'composer.lock',
        '.DS_Store', 'Thumbs.db', 'desktop.ini'
    }

    return path_name.lower() in ignore_patterns or path_name in ignore_files


def is_text_file(file_path):
    """
    Verifica se o arquivo é de texto e deve ter seu conteúdo incluído
    """
    text_extensions = {
        '.py', '.js', '.ts', '.jsx', '.tsx', '.html', '.htm', '.css', '.scss', '.sass',
        '.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf',
        '.txt', '.md', '.rst', '.log', '.csv', '.sql', '.sh', '.bat', '.ps1',
        '.php', '.rb', '.go', '.java', '.c', '.cpp', '.h', '.hpp',
        '.r', '.ipynb', '.dockerfile', '.makefile', '.gitignore',
        '.env', '.example', '.template', '.sample'
    }

    file_extension = Path(file_path).suffix.lower()
    file_name = Path(file_path).name.lower()

    if file_extension in text_extensions:
        return True

    no_extension_text_files = {
        'readme', 'license', 'changelog', 'dockerfile',
        'makefile', 'requirements', 'pipfile'
    }

    if file_extension == '' and file_name in no_extension_text_files:
        return True

    return False


def get_file_content(file_path):
    """
    Lê o conteúdo do arquivo de forma segura
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read(524288)  # Limite a 0.5 MB por arquivo
    except UnicodeDecodeError:
        try:
            with open(file_path, 'r', encoding='latin-1') as file:
                return file.read(524288)
        except:
            return "[ERRO: Não foi possível ler o arquivo com encoding alternativo]"
    except Exception as e:
        return f"[ERRO: {str(e)}]"


# =========================================================================
# FUNÇÃO DE FILTRAGEM CORRIGIDA (USANDO CAMINHOS RELATIVOS)
# =========================================================================
def is_path_in_targets(current_abs_path, root_abs_path, target_paths_objects):
    """
    Verifica se o caminho atual deve ser incluído.
    - current_abs_path: Path absoluto do item atual
    - root_abs_path: Path absoluto da raiz do projeto
    - target_paths_objects: lista de Path RELATIVOS (ex: Path('src/components'))
    """
    try:
        rel_path = current_abs_path.relative_to(root_abs_path)
    except ValueError:
        return False  # Fora da raiz do projeto

    for target in target_paths_objects:
        # Caso 1: Caminho atual é o alvo ou está dentro dele
        if rel_path == target or rel_path.is_relative_to(target):
            return True
        # Caso 2: Caminho atual é pai do alvo (precisa descer no os.walk)
        if target.is_relative_to(rel_path):
            return True
    return False
# =========================================================================


def generate_project_documentation():
    """
    Gera a documentação completa do projeto, filtrando pelos caminhos alvo
    """
    current_dir = Path.cwd()
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    output_file = f"project_documentation_{timestamp}.txt"

    # Usa caminhos RELATIVOS para os alvos
    target_paths_objects = [Path(p.strip()) for p in TARGET_SUBFOLDERS if p.strip()]
    target_display = [p.strip().rstrip(os.sep) for p in TARGET_SUBFOLDERS if p.strip()]

    if not target_paths_objects:
        raise ValueError("Nenhum caminho alvo configurado em TARGET_SUBFOLDERS.")

    with open(output_file, 'w', encoding='utf-8') as doc_file:
        doc_file.write("=" * 80 + "\n")
        doc_file.write("DOCUMENTAÇÃO DO PROJETO\n")
        doc_file.write("=" * 80 + "\n")
        doc_file.write(f"Projeto: {current_dir.name}\n")
        doc_file.write(f"Pasta base: {current_dir}\n")
        doc_file.write(f"Caminhos alvo selecionados: {', '.join(target_display) or 'Nenhum'}\n")
        doc_file.write(f"Data/Hora: {datetime.datetime.now().strftime('%d/%m/%Y às %H:%M:%S')}\n")
        doc_file.write("=" * 80 + "\n\n")

        # ---------------------------------------------------------
        # ÍNDICE DE PASTAS
        # ---------------------------------------------------------
        doc_file.write("ÍNDICE DE PASTAS\n")
        doc_file.write("-" * 40 + "\n")

        folders = []
        for root, dirs, files in os.walk(current_dir):
            current_path = Path(root)

            # Remove pastas ignoradas
            dirs[:] = [d for d in dirs if not should_ignore_path(d)]

            # Filtra apenas caminhos relevantes
            if not is_path_in_targets(current_path, current_dir, target_paths_objects):
                dirs[:] = []  # Não desce em subpastas irrelevantes
                continue

            relative = current_path.relative_to(current_dir)
            rel_str = "Raiz (.)" if relative == Path(".") else str(relative)
            folders.append(rel_str)
            doc_file.write(f"📁 {rel_str}\n")

        doc_file.write("\n" + "=" * 80 + "\n\n")

        # ---------------------------------------------------------
        # ESTRUTURA DETALHADA E CONTEÚDO DOS ARQUIVOS
        # ---------------------------------------------------------
        doc_file.write("ESTRUTURA DETALHADA E CONTEÚDO DOS ARQUIVOS\n")
        doc_file.write("-" * 50 + "\n\n")

        total_files = 0

        for root, dirs, files in os.walk(current_dir):
            current_path = Path(root)

            dirs[:] = [d for d in dirs if not should_ignore_path(d)]

            if not is_path_in_targets(current_path, current_dir, target_paths_objects):
                dirs[:] = []
                continue

            relative = current_path.relative_to(current_dir)
            rel_str = "Raiz (.)" if relative == Path(".") else str(relative)

            files = [f for f in files if not should_ignore_path(f)]
            # Separar targets em pastas e arquivos
            target_folders = [t for t in target_paths_objects if not t.suffix]
            target_files = [t for t in target_paths_objects if t.suffix]

            # Determinar se deve listar todos os arquivos nesta pasta (apenas se for target ou subpasta)
            should_list_all = any(relative == tf or relative.is_relative_to(tf) for tf in target_folders)

            files_to_include = sorted(files) if should_list_all else []

            # Adicionar arquivos alvo específicos nesta pasta
            for tf in target_files:
                if tf.parent == relative:
                    if tf.name not in files_to_include:
                        files_to_include.append(tf.name)

            files_to_include = sorted(files_to_include)

            if not files_to_include:
                continue

            doc_file.write(f"📁 {rel_str}\n")
            doc_file.write("│\n")
            total_files += len(files_to_include)

            for file_name in files_to_include:
                file_path = Path(root) / file_name
                doc_file.write(f"├── 📄 {file_name}\n")

                if is_text_file(file_path):
                    content = get_file_content(file_path)
                    doc_file.write("│   ┌─── CONTEÚDO ───\n")
                    lines = content.split('\n')
                    for i, line in enumerate(lines):
                        if i < 500:
                            doc_file.write(f"│   │ {line}\n")
                        else:
                            doc_file.write("│   │ [ ... CONTEÚDO TRUNCADO APÓS 500 LINHAS ... ]\n")
                            break
                    doc_file.write("│   └────────────────\n")
                else:
                    doc_file.write("│   [Arquivo binário - conteúdo não exibido]\n")
                doc_file.write("│\n")

            doc_file.write("\n" + "-" * 50 + "\n\n")

        # ---------------------------------------------------------
        # ESTATÍSTICAS
        # ---------------------------------------------------------
        total_folders = len(folders)

        doc_file.write("=" * 80 + "\n")
        doc_file.write("ESTATÍSTICAS DO PROJETO\n")
        doc_file.write("-" * 30 + "\n")
        doc_file.write(f"Total de pastas processadas: {total_folders}\n")
        doc_file.write(f"Total de arquivos encontrados: {total_files}\n")
        doc_file.write(f"Arquivo de documentação: {output_file}\n")
        doc_file.write("=" * 80 + "\n")

    return output_file


# ---------------------------------------------------------------
# EXECUÇÃO
# ---------------------------------------------------------------
if __name__ == "__main__":
    print("Iniciando geração da documentação do projeto…")
    print(f"Caminhos alvo selecionados: {TARGET_SUBFOLDERS}")

    try:
        output_file = generate_project_documentation()
        print("Documentação gerada com sucesso!")
        print(f"Arquivo criado: {output_file}")
        print(f"Localização: {Path.cwd() / output_file}")
    except Exception as e:
        print(f"Erro ao gerar documentação: {str(e)}")
        print("Verifique se você tem permissões de escrita na pasta atual.")