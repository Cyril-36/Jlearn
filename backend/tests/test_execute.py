"""Tests for the /api/execute endpoint."""


def test_execute_requires_auth(client):
    res = client.post("/api/execute", json={"code": "public class Solution {}"})
    assert res.status_code == 401


def test_execute_hello_world(client, auth_headers):
    code = 'public class Solution { public static void main(String[] args) { System.out.println("Hi"); } }'
    res = client.post("/api/execute", json={"code": code, "test_input": ""}, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "Hi" in data["output"]


def test_execute_compile_error(client, auth_headers):
    res = client.post("/api/execute", json={"code": "not java", "test_input": ""}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["success"] is False


def test_execute_with_input(client, auth_headers):
    code = (
        "import java.util.Scanner;"
        "public class Solution {"
        "  public static void main(String[] args) {"
        "    Scanner sc = new Scanner(System.in);"
        "    int n = sc.nextInt();"
        "    System.out.println(n * 2);"
        "  }"
        "}"
    )
    res = client.post("/api/execute", json={"code": code, "test_input": "5"}, headers=auth_headers)
    assert res.status_code == 200
    assert "10" in res.json()["output"]


def test_execute_returns_execution_time(client, auth_headers):
    code = 'public class Solution { public static void main(String[] args) { System.out.println(1); } }'
    res = client.post("/api/execute", json={"code": code}, headers=auth_headers)
    assert "execution_time_ms" in res.json()
