/**
 * Employee Entity
 * Represents a staff member with access to the system.
 */
export class Employee {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.role = data.role; // 'admin', 'manager', 'editor', 'viewer'
        this.joinedDate = data.joinedDate ? new Date(data.joinedDate) : new Date();
        this.department = data.department || 'General';
        this.active = data.active !== undefined ? data.active : true;
    }

    static fromApi(data) {
        return new Employee(data);
    }
}
