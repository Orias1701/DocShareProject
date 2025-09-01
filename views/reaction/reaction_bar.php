<div class="reaction-bar">
<?php foreach ($reactions as $type => $icon): 
    $active = (isset($userReaction) && $userReaction === $type) ? "active" : "";
    $count = isset($reactionCounts[$type]) ? $reactionCounts[$type] : 0;
?>
    <a href="index.php?action=toggle_reaction&reaction_type=<?php echo $type; ?>&post_id=<?php echo $post['post_id']; ?>" class="<?php echo $active; ?>">
        <?php echo $icon . " " . $count; ?>
    </a>
<?php endforeach; ?>
</div>
