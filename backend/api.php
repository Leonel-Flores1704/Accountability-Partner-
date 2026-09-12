<?php
declare(strict_types=1);

/**
 * Users REST API. Update these values with the database connection details.
 * Supported methods: OPTIONS, GET, POST, PUT, PATCH and DELETE.
 */
const DB_HOST = 'localhost';
const DB_NAME = 'app_mobile';
const DB_USER = 'CHANGE_ME';
const DB_PASSWORD = 'CHANGE_ME';
const ALLOWED_ORIGIN = '*'; // Replace with the deployed Angular domain in production.

header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function respond(int $status, mixed $data = null, ?string $message = null): never {
    http_response_code($status);
    $body = ['status' => $status];
    if ($message !== null) $body['message'] = $message;
    if ($data !== null) $body['data'] = $data;
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function requestBody(): array {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) respond(400, null, 'A valid JSON object is required.');
    return $body;
}

function userOutput(array $user): array {
    unset($user['password_hash']);
    $user['id'] = (int) $user['id'];
    $user['is_active'] = (bool) $user['is_active'];
    return $user;
}

function validateUser(array $input, bool $isCreate, bool $isReplace = false): array {
    $allowed = ['name', 'email', 'password', 'role', 'is_active'];
    $data = array_intersect_key($input, array_flip($allowed));
    foreach (['name', 'email'] as $field) {
        if (($isCreate || $isReplace) && empty($data[$field])) respond(422, null, "$field is required.");
    }
    if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) respond(422, null, 'Email is invalid.');
    if (($isCreate || $isReplace) && empty($data['password'])) respond(422, null, 'Password is required.');
    if (isset($data['password']) && strlen((string) $data['password']) < 8) respond(422, null, 'Password must have at least 8 characters.');
    if (isset($data['role']) && !in_array($data['role'], ['admin', 'user'], true)) respond(422, null, 'Role is invalid.');
    if (isset($data['is_active'])) $data['is_active'] = (int) filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);
    return $data;
}

try {
    $db = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASSWORD, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (PDOException) {
    respond(500, null, 'Database connection failed.');
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

if ($action === 'login' && $method === 'POST') {
    $input = requestBody();
    if (empty($input['email']) || empty($input['password'])) respond(422, null, 'Email and password are required.');
    $query = $db->prepare('SELECT id, name, email, password_hash, role, is_active, created_at FROM users WHERE email = ? LIMIT 1');
    $query->execute([strtolower(trim((string) $input['email']))]);
    $user = $query->fetch(PDO::FETCH_ASSOC);
    if (!$user || !$user['is_active'] || !password_verify((string) $input['password'], $user['password_hash'])) respond(401, null, 'Invalid email or password.');
    respond(200, ['user' => userOutput($user)], 'Login successful.');
}

if (($_GET['resource'] ?? '') !== 'users') respond(404, null, 'Resource not found.');

if ($method === 'GET') {
    if ($id) {
        $query = $db->prepare('SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?');
        $query->execute([$id]);
        $user = $query->fetch(PDO::FETCH_ASSOC);
        if (!$user) respond(404, null, 'User not found.');
        respond(200, userOutput($user));
    }
    $users = $db->query('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC);
    respond(200, array_map('userOutput', $users));
}

if (!$id && $method !== 'POST') respond(400, null, 'A valid user id is required.');

if ($method === 'POST') {
    $data = validateUser(requestBody(), true);
    $query = $db->prepare('INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)');
    try { $query->execute([$data['name'], strtolower($data['email']), password_hash($data['password'], PASSWORD_DEFAULT), $data['role'] ?? 'user', $data['is_active'] ?? 1]); }
    catch (PDOException $e) { if ($e->getCode() === '23000') respond(409, null, 'This email already exists.'); throw $e; }
    $newId = (int) $db->lastInsertId();
    $user = $db->query("SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $newId")->fetch(PDO::FETCH_ASSOC);
    respond(201, userOutput($user), 'User created.');
}

if (in_array($method, ['PUT', 'PATCH'], true)) {
    $data = validateUser(requestBody(), false, $method === 'PUT');
    if (!$data) respond(422, null, 'At least one user field is required.');
    if (isset($data['password'])) { $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT); unset($data['password']); }
    if (isset($data['email'])) $data['email'] = strtolower($data['email']);
    $sets = implode(', ', array_map(fn($field) => "$field = :$field", array_keys($data)));
    try { $query = $db->prepare("UPDATE users SET $sets WHERE id = :id"); $query->execute([...$data, 'id' => $id]); }
    catch (PDOException $e) { if ($e->getCode() === '23000') respond(409, null, 'This email already exists.'); throw $e; }
    if (!$query->rowCount()) { $exists = $db->prepare('SELECT id FROM users WHERE id = ?'); $exists->execute([$id]); if (!$exists->fetch()) respond(404, null, 'User not found.'); }
    $user = $db->prepare('SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?'); $user->execute([$id]);
    respond(200, userOutput($user->fetch(PDO::FETCH_ASSOC)), 'User updated.');
}

if ($method === 'DELETE') {
    $query = $db->prepare('DELETE FROM users WHERE id = ?'); $query->execute([$id]);
    if (!$query->rowCount()) respond(404, null, 'User not found.');
    respond(204);
}

respond(405, null, 'Method not allowed.');
