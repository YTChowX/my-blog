---
title: "TypeScript 高级类型技巧：从入门到实战"
date: "2025-11-15"
category: "编程"
tags: ["TypeScript", "前端开发", "教程"]
excerpt: "深入理解 TypeScript 的高级类型系统，掌握泛型、条件类型、映射类型等核心概念。"
---

# TypeScript 高级类型技巧

TypeScript 的类型系统非常强大，今天来分享一些实用的高级类型技巧。

## 1. 泛型约束

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "张三", age: 25 };
getProperty(user, "name"); // ✅ 类型安全
getProperty(user, "email"); // ❌ 编译错误
```

## 2. 条件类型

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">;  // true
type B = IsString<42>;       // false
```

## 3. 映射类型

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Optional<T> = {
  [P in keyof T]?: T[P];
};
```

## 4. 实用工具类型

TypeScript 内置了许多实用的工具类型：

- `Partial<T>` - 所有属性变为可选
- `Required<T>` - 所有属性变为必需
- `Pick<T, K>` - 选取部分属性
- `Omit<T, K>` - 排除部分属性
- `Record<K, V>` - 构造键值对类型

## 总结

掌握这些高级类型技巧，能让你的 TypeScript 代码更加类型安全和可维护。建议在实际项目中多加练习！
