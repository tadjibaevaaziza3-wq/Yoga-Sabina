import { prisma } from "@/lib/prisma"
import { TriggerConditionType, TriggerChannel, TriggerStatus } from "@prisma/client"
import { sendTelegramMessage } from "@/lib/telegram/bot"

export class TriggerEngine {
    /**
     * Main entry point to run the automation engine.
     * Should be called via a Cron job (e.g., every 10-15 mins).
     */
    static async run() {
        console.log("Starting Trigger Engine...")

        try {
            // 1. Fetch active triggers
            const triggers = await prisma.trigger.findMany({
                where: { isActive: true }
            })

            console.log(`Found ${triggers.length} active triggers`)

            for (const trigger of triggers) {
                await this.processTrigger(trigger)
            }
        } catch (error) {
            console.error("Trigger Engine Run Failed:", error)
        }

        console.log("Trigger Engine finished.")
    }

    private static async processTrigger(trigger: any) {
        // Logic to evaluate conditions based on trigger type
        let eligibleUsers: any[] = []

        try {
            switch (trigger.conditionType) {
                case TriggerConditionType.REGISTERED_NO_PURCHASE:
                    eligibleUsers = await this.findRegisteredNoPurchaseUsers()
                    break
                case TriggerConditionType.VIEWED_COURSE_NO_SUB:
                    // requires more complex tracking implementation
                    break
                case TriggerConditionType.INACTIVE_3_DAYS:
                    eligibleUsers = await this.findInactiveUsers(3)
                    break
                case TriggerConditionType.INACTIVE_10_DAYS:
                    eligibleUsers = await this.findInactiveUsers(10)
                    break
                // ... other cases
            }

            if (eligibleUsers.length > 0) {
                console.log(`Trigger "${trigger.name}": Found ${eligibleUsers.length} eligible users`)

                for (const user of eligibleUsers) {
                    await this.dispatchTrigger(trigger, user)
                }
            }
        } catch (error) {
            console.error(`Error processing trigger ${trigger.name}:`, error)
        }
    }

    // --- Condition Evaluators ---

    private static async findRegisteredNoPurchaseUsers() {
        // Users created > 24h ago with 0 orders
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

        // Only fetch users who have a Telegram ID to contact
        return await prisma.user.findMany({
            where: {
                createdAt: { lt: yesterday },
                purchases: { none: {} },
                subscriptions: { none: {} },
                telegramId: { not: null }
            }
        })
    }

    private static async findInactiveUsers(days: number) {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

        // Find users who were last active BEFORE the cutoff 
        // AND haven't been active SINCE the cutoff
        // This logic is simplified; distinct logs usually needed for precise "no activity since"
        return await prisma.user.findMany({
            where: {
                updatedAt: { lt: cutoff },
                telegramId: { not: null }
            }
        })
    }


    // --- Dispatcher ---

    private static async dispatchTrigger(trigger: any, user: any) {
        // 1. Check Idempotency / Frequency Capping
        const alreadySent = await prisma.triggerLog.findFirst({
            where: {
                triggerId: trigger.id,
                userId: user.id
            }
        })

        if (alreadySent) return // One-time trigger per user for now

        // 2. Prepare Message
        const message = this.interpolateMessage(trigger.messageTemplate, user)
        const template = trigger.messageTemplate as any
        const buttons = template?.buttons || []

        // 3. Send via Channel
        let status: TriggerStatus = TriggerStatus.SENT
        let metadata: any = { message }

        try {
            if (trigger.channel === TriggerChannel.TELEGRAM) {
                if (user.telegramId) {
                    const result = await sendTelegramMessage(
                        user.telegramId,
                        message,
                        template?.image ? 'PHOTO' : 'TEXT',
                        template?.image,
                        buttons
                    )

                    if (!result.success) {
                        status = TriggerStatus.FAILED
                        metadata.error = result.error
                    }
                } else {
                    status = TriggerStatus.FAILED // No generic channel available
                    metadata.error = "No Telegram ID"
                }
            }
        } catch (e: any) {
            console.error("Failed to send trigger", e)
            status = TriggerStatus.FAILED
            metadata.error = e.message
        }

        // 4. Log Result
        await prisma.triggerLog.create({
            data: {
                triggerId: trigger.id,
                userId: user.id,
                status: status,
                metadata: metadata
            }
        })
    }

    private static interpolateMessage(template: any, user: any): string {
        let text = template?.text || ""
        // Basic interpolation
        text = text.replace(/{user_name}|{name}/g, user.firstName || "Foydalanuvchi")
        return text
    }
}
