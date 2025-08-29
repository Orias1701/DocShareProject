<?php
require_once __DIR__ . '/../models/Role.php';

class RoleController {
    private $roleModel;

    public function __construct() {
        $this->roleModel = new Role();
    }

    public function listRoles() {
        $roles = $this->roleModel->getAllRoles();
        include __DIR__ . '/../views/role/list.php';
    }

    public function showCreateForm() {
        include __DIR__ . '/../views/role/create.php';
    }

    public function create() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $roleName = $_POST['role_name'];
            $this->roleModel->createRole($roleName);
            header("Location: index.php?action=list_roles");
            exit;
        }
    }

    public function showEditForm() {
        $id = $_GET['id'];
        $role = $this->roleModel->getRoleById($id);
        include __DIR__ . '/../views/role/edit.php';
    }

    public function update() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['role_id'];
            $roleName = $_POST['role_name'];
            $this->roleModel->updateRole($id, $roleName);
            header("Location: index.php?action=list_roles");
            exit;
        }
    }

    public function delete() {
        $id = $_GET['id'];
        $this->roleModel->deleteRole($id);
        header("Location: index.php?action=list_roles");
        exit;
    }
}