<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel - Rent Cars Project</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <style>
        body {
            overflow-x: hidden;
        }

        .sidebar {
            background: #f8f9fa;
            border-right: 1px solid #dee2e6;
            padding: 1rem;
        }

        @media (min-width: 768px) {
            .sidebar {
                position: sticky;
                top: 0;
                height: calc(100vh - 56px);
                overflow-y: auto;
            }

            .sidebar::-webkit-scrollbar {
                width: 6px;
            }

            .sidebar::-webkit-scrollbar-thumb {
                background: #6c757d;
                border-radius: 3px;
            }
        }

        @media (max-width: 767px) {
            .sidebar {
                border-right: none;
                border-bottom: 1px solid #dee2e6;
            }

            #main-content {
                margin-top: 1rem;
            }
        }

        .table-responsive {
            overflow-x: auto;
        }

        .card:hover {
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }

        .nav-link {
            cursor: pointer;
            transition: all 0.3s;
        }

        .spinner-border {
            width: 3rem;
            height: 3rem;
        }

        .badge {
            padding: 0.5em 0.8em;
            font-size: 0.85em;
        }

        @media (max-width: 576px) {
            .btn-sm {
                font-size: 0.75rem;
                padding: 0.25rem 0.4rem;
            }
        }
    </style>
</head>

<body>

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">Rent Cars Project</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse justify-content-center" id="navbarNav">
                <ul class="navbar-nav nav-underline" id="nav-links">
                </ul>
            </div>
            <span class="navbar-text text-white me-3" id="user-name">Carregando...</span>
            <button class="btn btn-outline-danger btn-sm" id="btn-logout">Sair</button>
        </div>
    </nav>

    <div class="container-fluid">
        <div class="row">

            <aside class="col-md-3 col-lg-2 sidebar" id="sidebar-area">
                <h5 class="mb-3 d-flex align-items-center">
                    <i class="bi bi-funnel me-2"></i>
                    Filtros
                </h5>
                <div id="sidebar-content">
                </div>
            </aside>

            <main class="col-md-9 col-lg-10 p-4">
                <div id="main-content">
                    <div class="text-center mt-5">
                        <div class="spinner-border text-primary"></div>
                        <p class="mt-3 text-muted">Carregando sistema...</p>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <script src="/js/utils.js"></script>
    <script src="/js/admin-sections.js"></script>
    <script src="/js/client-view.js"></script>
    <script src="/js/app-home.js"></script>
</body>

</html>