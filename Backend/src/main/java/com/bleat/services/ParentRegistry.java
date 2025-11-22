package com.bleat.services;

import com.bleat.models.Parent;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Optional;

public class ParentRegistry {
    private static ParentRegistry instance;
    private Map<Integer, Parent> parents = new ConcurrentHashMap<>();

    private ParentRegistry() {
    }

    public static synchronized ParentRegistry getInstance() {
        if (instance == null)
            instance = new ParentRegistry();
        return instance;
    }

    public void addParent(Parent p) {
        parents.put(p.getUserId(), p);
    }

    public Parent removeParent(int id) {
        return parents.remove(id);
    }

    public Optional<Parent> findByNameAndPassword(String name, String password) {
        return parents.values().stream().filter(p -> p.getName().equals(name) && p.login(name, password)).findFirst();
    }

    public java.util.List<Parent> listAll() {
        return new java.util.ArrayList<>(parents.values());
    }
}
