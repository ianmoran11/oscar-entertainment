hanged to MAX_ITERATIONS to match the rest of the script
MAX_ITERATIONS=25

for ((i=1; i<=MAX_ITERATIONS; i++)); do

    echo -e "\n--- Starting iteration $i ---\n"

    # Run Claude and pipe to both console and log
    # Added 2>&1 to ensure errors are also captured in the log if needed
    claude --dangerously-skip-permissions -p "
    Read PRD.md and progress.txt.
    1. Find the highest-priority uncompleted task.
    2. Implement it. If you need to install new packages, do so.
    3. Run the tests/dev server to verify.
    4. If it works, update progress.txt and commit the changes.
    5. ONLY DO ONE TASK.
    If all tasks in PRD.md are fully complete, output exactly: <promise>COMPLETE</promise>
    " 2>&1 | tee current_iteration.log

    # Check the log file for the completion string
    if grep -q "<promise>COMPLETE</promise>" current_iteration.log; then
        echo -e "\n✅ PRD complete after $i iterations."
        rm current_iteration.log
        exit 0
    fi

done

echo -e "\n⚠️ Reached max iterations ($MAX_ITERATIONS) without completion."
rm current_iteration.log
exit 1
