import { TableSkeletonRows } from "@/app/components/table-skeleton-rows";
import { formatDate } from "@/lib/format";
import type { TeamMember } from "@/lib/types";

export function TeamMembersTable({
    team,
    currentUserId,
    onRemove,
}: Readonly<{
    /** `null` enquanto carrega. */
    team: TeamMember[] | null;
    currentUserId: string;
    onRemove: (member: TeamMember) => void;
}>) {
    return (
        <section aria-labelledby="team-title" className="team-section">
            <div className="team-section-heading">
                <h2 id="team-title">Equipe atual</h2>
                <span className="subtle-count">{team?.length ?? "—"}</span>
            </div>
            <div className="table-card">
                <div className="table-scroll">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Pessoa</th>
                                <th>Papel</th>
                                <th>Decisões</th>
                                <th>Na equipe desde</th>
                                <th><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {!team && <TableSkeletonRows columns={5} rows={1} />}
                            {team?.map((member) => (
                                <tr key={member.id}>
                                    <td>
                                        <span className="table-primary">
                                            {member.name}
                                            {member.id === currentUserId && " (você)"}
                                        </span>
                                        <span className="table-secondary">{member.email}</span>
                                    </td>
                                    <td>
                                        <span className={`role-tag ${member.role === "admin" ? "role-tag-admin" : ""}`}>
                                            {member.role === "admin" ? "Administrador" : "Moderador"}
                                        </span>
                                    </td>
                                    <td><span className="table-primary">{member.decisions_count}</span></td>
                                    <td>
                                        <span className="table-primary">
                                            {formatDate(member.joined_at ?? member.created_at)}
                                        </span>
                                        <span className="table-secondary">
                                            {member.joined_at ? "Por convite" : "Conta criada"}
                                        </span>
                                    </td>
                                    <td>
                                        {member.role === "moderator" && member.id !== currentUserId && (
                                            <div className="row-actions">
                                                <button
                                                    className="button button-danger button-small"
                                                    onClick={() => onRemove(member)}
                                                    type="button"
                                                >
                                                    Remover permissão
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
